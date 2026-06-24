const notFound = (req, res, next) => {
  res.status(404).json({
    message: "Not Found",
    statusCode: 404,
  });
};

export default notFound;
