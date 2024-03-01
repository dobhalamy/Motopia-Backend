const { getVehicleSyncJobDates } = require("./agenda");

const SEND_INTERVAL = 10000;

const writeSyncDMSEvent = (res, sseId, data) => {
  res.write(`id: ${sseId}\n`);
  res.write(`data: ${data}\n\n`);
};

exports.sendSyncDMSEvent = async (_req, res) => {
  res.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
  });
  const { isInProgress, lastRunAt } = await getVehicleSyncJobDates();
  let data = isInProgress;
  const sseId = new Date(lastRunAt).toDateString();

  const progressSync = setInterval(async () => {
    const { isInProgress } = await getVehicleSyncJobDates();
    data = isInProgress;
    writeSyncDMSEvent(res, sseId, data);
    if (!isInProgress) {
      clearInterval(progressSync);
    }
  }, SEND_INTERVAL);

  writeSyncDMSEvent(res, sseId, data);
};