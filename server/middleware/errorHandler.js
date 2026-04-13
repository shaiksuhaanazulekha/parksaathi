const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const status = err.statusCode || 500;
    const message = err.message || 'Something went wrong on the server';

    res.status(status).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = { errorHandler };
