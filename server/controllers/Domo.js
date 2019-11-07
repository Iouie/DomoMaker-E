const models = require('../models');
const Domo = models.Domo;

const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: 'An error occured',
      });
    }

    return res.render('app', {
      csrfToken: req.csrfToken(),
      domos: docs,
    });
  });
};

const makeDomo = (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.level) {
    return res.status(400).json({
      error: 'RAWR! Both name, age, and level are required',
    });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    level: req.body.level,
    owner: req.session.account._id,
  };

  const newDomo = new Domo.DomoModel(domoData);

  const domoPromise = newDomo.save();

  domoPromise.then(() => res.json({
    redirect: '/maker',
  }));

  domoPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Domo already exists',
      });
    }

    return res.status(400).json({
      error: 'An error occured',
    });
  });

  return domoPromise;
};

const getDomos = (request, response) => {
  const req = request;
  const res = response;

  return Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: 'An error occurred ',
      });
    }

    return res.json({
      domos: docs,
    });
  });
};

// delete Domos
const deleteDomo = (req, res) => {
  const name = `${req.body.name}`;
  if (!name) {
    return res.status(400).json({
      error: 'Name required',
    });
  }

  return Domo.DomoModel.findByName(name, (err, docs) => {
    if (err || docs.length === 0) {
      return res.status(400).json({ error: 'No Domo exists' });
    }
    Domo.DomoModel.removeAllByName(name, (error) => {
      if (error) {
        return res.status(400).json({ error: 'an error occured' });
      }
      return getDomos(req, res);
    });
  });
};

module.exports = {
  makerPage,
  make: makeDomo,
  getDomos,
  deleteDomo,
};
