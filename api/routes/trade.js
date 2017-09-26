const router = require('express').Router()
const Trades = require('./../models').Trades

router.get('/api/trades/', (req, res, next) => {
  let id = req.account.data._id

  Trades.find({
    $or: [{
      owner: id
    }, {
      trader: id
    }]
  }).populate(['owner', 'trader', 'book']).sort('date_added').exec(function (err, trades) {
    if (err) next(err)

    res.json(trades)
  })
})

router.put('/api/trades/', (req, res, next) => {
  let trade = req.body

  if (trade.owner._id === req.account.data._id) {
    Trades.findByIdAndUpdate(trade._id, {
      $set: {
        isCompleted: true,
        isApproved: trade.isApproved
      }
    }, {
      upsert: true
    }, (err, t) => {
      if (err) next(err)

      res.json(t || true)
    })
  } else {
    res.status(403)
  }
})

router.post('/api/trades/', (req, res, next) => {
  let trade = new Trades(req.body)
  trade.trader = req.account.data._id
  trade.isCompleted = false
  trade.isApproved = false
  trade.date_added = new Date()

  trade.save((err, t) => {
    if (err) next(err)

    res.json(t)
  })
})

router.delete('/api/trades/:id/', (req, res, next) => {
  let id = req.params.id
  let userId = req.account.data._id

  Trades.findOneAndRemove({
    _id: id,
    trader: userId
  }).exec((err, trade) => {
    if (err) next(err)

    res.json(trade)
  })
})

module.exports = router
