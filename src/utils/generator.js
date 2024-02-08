const { generate } = require("random-words");

export function generateRandomWords(length) {
    return generate({ minLength: 5, maxLength: 10, exactly: length }).join(" ")
}