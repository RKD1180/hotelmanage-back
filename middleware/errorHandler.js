exports.handleErrors = (err, req, res, next) => {
    console.error(err.stack);

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parse error
        return res.status(400).json({ error: 'Bad Request - Invalid JSON' });
    }

    res.status(500).json({ error: 'Internal Server Error' });
};

