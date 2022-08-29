const advancedMiddleWare = (model, populate) => async (req, res, next) => {
  let query = req.query;
  let reqQuery = { ...req.query };

  let removeFeilds = ["select", "sort", "limit", "skip"];

  removeFeilds.forEach((param) => delete reqQuery[param]);

  query = JSON.stringify(reqQuery).replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  let queryStr = model.find(JSON.parse(query));

  if (req.query.select) {
    queryStr.select(req.query.select.split(",").join(" "));
  }

  if (req.query.sort) {
    queryStr.sort(req.query.sort.split(",").join(" "));
  } else {
    queryStr.sort("-createdAt");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const pagesStartDocIndex = (page - 1) * limit;
  const pagesLastDocIndex = page * limit;
  const total = await model.countDocuments();
  let pagination = {};

  queryStr.limit(limit).skip(pagesStartDocIndex);

  if (populate) {
    populate.forEach((p) => {
      queryStr = queryStr.populate(p);
    });
  }

  const result = await queryStr;
  console.log("result", result);
  if (pagesStartDocIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  if (pagesLastDocIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  res.advancedMiddleWare = {
    success: true,
    pagination,
    count: result.length,
    data: result,
  };
  next();
};

module.exports = advancedMiddleWare;
