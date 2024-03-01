const CardModel = require("../models/home-card");
const config = require("../../config");
const folderName = config.get("cardFolder");
const fs = require("fs");
const base64Img = require("base64-img");
const { uploadCardIcon, destroyImage } = require("../helpers/cloudinary");

exports.getCards = async (req, res, next) => {
  try {
    const cards = await CardModel.find();
    const transform = cards.map(card => {
      return {
        _id: card._id,
        title: card.title,
        icon: card.icon.src,
        links: card.links,
        mainLink: card.mainLink,
        position: card.position
      };
    });
    res.json({
      status: "success",
      data: transform
    });
  } catch (error) {
    next(error);
  }
};

exports.createCards = async (req, res, next) => {
  const { cards } = req.body;
  const withId = cards.filter(card => card._id);
  const withoutId = cards.filter(card => !card._id);

  try {
    const cardsDB = await CardModel.find();
    const incomeIds = withId.map(card => card._id);
    const dbIds = cardsDB.map(card => card._id);
    const idsForDelete = [];
    dbIds.map(id => {
      if (!incomeIds.includes(id.toString())) {
        idsForDelete.push(id);
      }
    });
    idsForDelete.map(async id => await CardModel.findOneAndDelete({ _id: id }));

    withId.length > 0 &&
      withId.map(async card => {
        if (card.icon && card.icon.includes("cloudinary")) {
          return;
        } else {
          try {
            const cardDB = await CardModel.findOne({ _id: card._id });
            cardDB.icon && (await destroyImage(cardDB.icon.publicId));

            const { icon } = card;
            if (icon && icon.length > 0) {
              const filepath = base64Img.imgSync(icon, "icons", Date.now());
              const img = await uploadCardIcon(filepath, folderName);
              const newIcon = {
                src: img.secure_url,
                publicId: img.public_id
              };
              await fs.promises.unlink(filepath);
              await CardModel.findOneAndUpdate(
                { _id: card._id },
                { icon: newIcon, position: card.position }
              );
            }
          } catch (error) {
            console.error(error);
            next(error);
          }
        }
      });

    withoutId.length > 0 &&
      withoutId.map(async card => {
        try {
          const { icon } = card;
          if (icon && icon.length > 0) {
            const filepath = base64Img.imgSync(icon, "icons", Date.now());
            const img = await uploadCardIcon(filepath, folderName);
            const newIcon = {
              src: img.secure_url,
              publicId: img.public_id
            };
            await fs.promises.unlink(filepath);
            const newCard = new CardModel({ ...card, icon: newIcon });
            await newCard.save();
          } else {
            await new CardModel(card).save();
          }
        } catch (error) {
          console.error(error);
          next(error);
        }
      });

    res.json({ status: "success" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
