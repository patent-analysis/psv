const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
const COLOR_PALETTE = ['#E0A458', 
    '#FFDBB5', '#C04ABC', '#BCB6FF', '#82ABA1', '#C6F91F', '#D4C9C7', '#F4442E'];
/* 
 * Given an array of elements returns an objects where each element is the key and the value is a hexadecimal color code
*/
const assignColors = (keys) => {
    const colors = {};
    keys.forEach((element, index) => {
        let color = COLOR_PALETTE[index];
        // We try to pick from a predefined palette, if the number of keys is bigger than
        // what we currently have we create a random color
        if (index < COLOR_PALETTE.length) {
            color = COLOR_PALETTE[index];
        } else {
            color = getRandomColor();
        }

        colors[element] = color;
    });
    return colors;
};

export {
    assignColors
};