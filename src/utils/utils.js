const getUnique = (data, key) => {
    const keyList = data.map((elem) => elem[key]);
    const uniqueKeys = new Set(keyList);
    return Array.from(uniqueKeys);
}

export { getUnique };