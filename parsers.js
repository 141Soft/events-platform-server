

export const parseSQL = (file) => {
    //Removes whitespace/newline chars then splits into statements removing empty strings
    return String(file)
        .replace(/(\r\n|\n|\r)/gm, ' ')
        .replace(/\s+/g, ' ')
        .split(';')
        .filter((query) => query !== ' ');
}