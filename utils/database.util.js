const retry = async (operation, retries = 3, delay = 1000) => {
    try {
        return await operation();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(operation, retries - 1, delay * 2);
    }
};

module.exports = { retry };