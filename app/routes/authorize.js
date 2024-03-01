const router = require("express").Router();
const {
  transactionList,
  batchList,
  paymentPage
} = require("../helpers/authorize");
const { createCustomer, chargeCreditCard, sendReceipt } = require('../controllers/authorize');

router.post('/createCustomer', createCustomer);
router.post('/chargeCreditCard', chargeCreditCard);
router.post('/sendReceipt', sendReceipt);

router.get("/all", async (req, res) => {
  try {
    const result = await transactionList();
    res.json({ status: "success", result });
  } catch (error) {
    console.error(error);
    res.json({ status: "error", error });
  }
});

router.get("/batch", async (req, res) => {
  try {
    const result = await batchList();
    res.json({ status: "success", result });
  } catch (error) {
    console.error(error);
    res.json({ status: "error", error });
  }
});

router.get("/list", async (req, res) => {
  try {
    const result = await unsettledTransactionList();
    res.json({ status: "success", result });
  } catch (error) {
    res.json({ status: "error", error });
  }
});

router.get("/page", async (req, res) => {
  try {
    const token = await paymentPage();
    res.render("redirect", { token: token });
    // res.redirect(`https://test.authorize.net/payment/payment?token=${token}`);
    // res.json({ status: "success", result });
  } catch (error) {
    console.error(error);
    res.json({ status: "error", error });
  }
});

module.exports = router;
