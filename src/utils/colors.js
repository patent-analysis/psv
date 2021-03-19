const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
/* 
 * Given an array of elements returns an objects where each element is the key and the value is a hexadecimal color code
*/
const assignColors = (keys) => {
    const colorTracker = {};
    const colors = {};

    keys.forEach((element) => {
        let randomColor = getRandomColor();
        // Make sure we have not assigned that color yet
        // We can make this better and make sure that colors are not too close to each other
        while(colorTracker[randomColor]) {
            randomColor = getRandomColor();
        }
        colorTracker[randomColor] = true;
        colors[element] = randomColor;
    });
    return colors;
};

export {
    assignColors
};