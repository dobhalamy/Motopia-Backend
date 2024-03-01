const Agenda = require('agenda');

const { dbUrl } = require('../../server-config');
const { AGENDA_NAMES, AGENDA_TIME_FRAMES, isDevEnv } = require('../constants');
const { availableVehicleList, deleteVehicleFromCMS } = require('./dms');

console.log('Agenda isDevEnv', isDevEnv);

exports.agenda = new Agenda({
  db: { address: dbUrl, collection: 'Schedule' },
  processEvery: '5 minutes',
  defaultLockLifetime: isDevEnv ? 5000 : 10000,
  maxConcurrency: 5,
  defaultConcurrency: 1,
});

exports.gracefulSchedule = async () => {
  await this.agenda.stop();
  console.info('Schedule was stopped');
  process.exit(0);
};

exports.getVehicleSyncJobDates = async () => {
  try {
    const jobs = await this.agenda.jobs({ name: AGENDA_NAMES.vehicleSync });
    const {
      lastRunAt,
      lastFinishedAt,
      nextRunAt,
      repeatTimezone: timeZone,
    } = jobs[0].attrs;
    const lastRunDate = new Date(lastRunAt);
    const lastFinishedDate = new Date(lastFinishedAt);
    const isInProgress = lastRunDate > lastFinishedDate;
    const dates = {
      lastRunAt: lastRunDate.toLocaleString('en-US', {
        timeZone,
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      lastFinishedAt: lastFinishedDate.toLocaleString('en-US', {
        timeZone,
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      nextRunAt: new Date(nextRunAt).toLocaleString('en-US', {
        timeZone,
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      isInProgress,
    };
    return dates;
  } catch (error) {
    console.error(error);
  }
};

exports.runVehicleSync = async () => {
  const jobs = await this.agenda.jobs({ name: AGENDA_NAMES.vehicleSync });
  const single = jobs.filter(job => job.attrs.type === 'single')[0];
  single.run();
  return true;
};

exports.startAgenda = () => {
  this.agenda.on('ready', async () => {
    this.agenda.define(
      AGENDA_NAMES.vehicleSync,
      { priority: 'high', shouldSaveResult: true },
      availableVehicleList
    );
    this.agenda.define(
      AGENDA_NAMES.vehicleDeletion,
      { priority: 'high', shouldSaveResult: true },
      deleteVehicleFromCMS
    );
    console.info('Schedule was started');
    await this.agenda.every(
      AGENDA_TIME_FRAMES.fourHours,
      AGENDA_NAMES.vehicleSync,
      null,
      {
        timezone: 'America/New_York',
      }
    );
    await this.agenda.every(
      AGENDA_TIME_FRAMES.midnightAfter30Min,
      AGENDA_NAMES.vehicleDeletion,
      null,
      {
        timezone: 'America/New_York',
      }
    );
    this.agenda.start();
  });
};
