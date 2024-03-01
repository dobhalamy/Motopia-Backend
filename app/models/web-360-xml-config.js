const mongoose = require("mongoose");
const { Schema } = mongoose;

const DEFAULT_TRUE = {
  type: Boolean,
  default: true,
};

const DEFAULT_FALSE = {
  type: Boolean,
  default: false,
}

const DEFAULT_NUMBER = (number) => ({
  type: Number,
  default: number,
});

const DEFAULT_STRING = (string) => ({
  type: String,
  default: string,
});


const web360XmlConfig = new Schema({
  name: {
    type: String,
    index: true,
    unique: true,
  },
  file: {
    root: {
      config: {
        settings: {
          preloader: {
              '@_image': DEFAULT_STRING(''),
          },
          userInterface: {
              '@_showZoomButtons': DEFAULT_TRUE,
              '@_showToolTips': DEFAULT_TRUE,
              '@_showHotspotsButton': DEFAULT_FALSE,
              '@_showFullScreenButton': DEFAULT_TRUE,
              '@_showTogglePlayButton': DEFAULT_TRUE,
              '@_showArrows': DEFAULT_TRUE,
              '@_toolbarAlign': DEFAULT_STRING('center'),
              '@_toolbarBackColor': DEFAULT_STRING('transparent'),
              '@_toolbarHoverColor': DEFAULT_STRING('#808285'),
              '@_toolbarForeColor': DEFAULT_STRING('#A7A9AE'),
              '@_toolbarBackAlpha': DEFAULT_NUMBER(0),
              '@_toolbarAlpha': DEFAULT_NUMBER(1),
              '@_showProgressNumbers': DEFAULT_TRUE,
              '@_showFullScreenToolbar': DEFAULT_TRUE,
              '@_fullScreenBackColor': DEFAULT_STRING('#FFFFFF'),
              '@_toolbarPosition': DEFAULT_NUMBER(0),
              '@_customCursorClass': DEFAULT_STRING('default_cursor'),
              '@_viewerHint': DEFAULT_STRING(''),
              '@_toolbarAutohide': DEFAULT_FALSE,
              '@_showToolbarOnLoadStart': DEFAULT_TRUE
          },
          control: {
              '@_dragSpeed': DEFAULT_NUMBER(0.13),
              '@_doubleClickZooms': DEFAULT_TRUE,
              '@_disableMouseControl': DEFAULT_FALSE,
              '@_showHighresOnFullScreen': DEFAULT_TRUE,
              '@_mouseHoverDrag': DEFAULT_FALSE,
              '@_hideHotspotsOnLoad': DEFAULT_FALSE,
              '@_hideHotspotsOnZoom': DEFAULT_TRUE,
              '@_rowSensitivity': DEFAULT_NUMBER(15),
              '@_dragSensitivity': DEFAULT_NUMBER(10),
              '@_inBrowserFullScreen': DEFAULT_FALSE,
              '@_doubleClickFullscreen': DEFAULT_FALSE,
              '@_zoomSteps': DEFAULT_NUMBER(1),
              '@_zoomSpeed': DEFAULT_NUMBER(300),
              '@_singleClickZooms': DEFAULT_FALSE,
              '@_pauseOnPreload': DEFAULT_TRUE,
              '@_resumePreloadOnHover': DEFAULT_FALSE,
              '@_mouseWheelDrag': DEFAULT_FALSE,
              '@_mouseWheelDragZoomOnly': DEFAULT_FALSE,
              '@_allowRotateInputInZoom': DEFAULT_FALSE,
              '@_allowPanX': DEFAULT_TRUE,
              '@_allowPanY': DEFAULT_TRUE,
              '@_dragAcceleration': DEFAULT_NUMBER(1),
              '@_centerZoom': DEFAULT_FALSE,
              '@_maxZoom': DEFAULT_NUMBER(100)
          },
          rotation: {
              '@_firstImage': DEFAULT_NUMBER(0),
              '@_rotate': DEFAULT_FALSE,
              '@_rotatePeriod': DEFAULT_NUMBER(7),
              '@_bounce': DEFAULT_FALSE,
              '@_rotateDirection': DEFAULT_NUMBER(-1),
              '@_forceDirection': DEFAULT_FALSE,
              '@_inertiaRelToDragSpeed': DEFAULT_TRUE,
              '@_inertiaTimeToStop': DEFAULT_NUMBER(700),
              '@_inertiaMaxInterval': DEFAULT_NUMBER(120),
              '@_useInertia': DEFAULT_TRUE,
              '@_flipHorizontalInput': DEFAULT_FALSE,
              '@_flipVerticalInput': DEFAULT_TRUE,
              '@_bounceRows': DEFAULT_TRUE,
              '@_rowsOnSingleIndex': DEFAULT_FALSE,
              '@_flipAxis': DEFAULT_FALSE,
              '@_spinOnPageScroll': DEFAULT_FALSE,
              '@_pageScrollFollow': DEFAULT_FALSE,
              '@_pageScrollDelay': DEFAULT_NUMBER(300),
              '@_pageScrollPeriod': DEFAULT_NUMBER(3)
          }
        },
        hotspots: {
          hotspot: [{
            _id: false,
            spotinfo: {
              "@_txt": String,
              "@_css": String,
              "@_clickAction": String,
              "@_clickData": String,
              "@_clickDataParam": String,
              cdata: String
            },
            "@_id": { type: String, required: true },
            "@_renderMode": DEFAULT_NUMBER(0),
            "@_indicatorImage": DEFAULT_STRING('circ-cross-thin-orange.svg'),
            "@_effects": DEFAULT_STRING("pulseSimple"),
            "@_margin": DEFAULT_STRING("0,15,0,15"),
            "@_align": DEFAULT_STRING("center, left"),
          }]
        },
        images: {
          image: [{
            _id: false,
            hotspot: [{
              _id: false,
              '@_source': String,
              '@_offsetX': Number,
              '@_offsetY': Number,
            }],
            highres: {
              '@_src': String,
            },
            '@_src': String,
            '@_label': String,
          }],
          '@_rows': DEFAULT_NUMBER(3),
          "@_highresWidth": Number,
          "@_highresHeight": Number,
        }
      }
    }
  }
}, {
  versionKey: false,
});
const Web360XmlConfig = mongoose.model('Web-360-xml-config', web360XmlConfig);

module.exports = Web360XmlConfig;
