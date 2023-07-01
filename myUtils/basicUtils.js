function UcFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function Capitalize(string) {
	return string.trim().charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function formatString(entry) {
	return entry.split(' ').map(function (p) {
		return Capitalize(p);
	}).join(' ');
}
function Capitalize(string) {
    let index = 0;

    // Remove non-alphabetical characters from the beginning
    while (index < string.length && !/[a-zA-Z]/.test(string.charAt(index))) {
        index++;
    }
    string = string.slice(index).replace(/^[^a-zA-Z]+/, '');

    // Capitalize the string if it starts with a lowercase letter
    if (index < string.length && string.charAt(index) === string.charAt(index).toLowerCase()) {
        string = string.charAt(index).toUpperCase() + string.slice(index + 1);
    }


    return string;
}


