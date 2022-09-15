

const log = console.log;

const qs = (id, parent = null) => {
    parent = parent ?? document;
    if (id.charAt(0) === ".") return parent.querySelectorAll(id);
    if (id.charAt(0) !== "#") return parent.querySelector("#" + id);
    return parent.querySelector(id);
};


const whittle = (array, num) => {
    while (array.length > num) {
        const rand = Math.floor(Math.random() * array.length);
        array.splice(rand, 1);
    }
    return array;
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


function SettingsSaver(def = {}) {

    this.key = def.key ?? "system_eitango";

    localStorage[this.key] = localStorage[this.key] ?? JSON.stringify({});

    const saveSettings = obj => localStorage[this.key] = JSON.stringify(obj);
    const getValues = () => JSON.parse(localStorage[this.key]);

    const dataHoldingAttributeFor = {
        "checkbox": "checked",
        "text": "value",
        "number": "value",
        "select-one": "value",
        "select-multiple": "value",
    };

    const getValue = elem => elem[dataHoldingAttributeFor[elem.type]];

    this.registerInput = array => {
        const inputs = Array.isArray(array) ? array : [array];
        inputs.forEach(input => registerSingleInput(input));
    };

    const registerSingleInput = id => {
        const elem = qs(id);
        elem.addEventListener("change", () => {
            const updated = getValues();
            updated[id] = getValue(elem);
            saveSettings(updated);
        });
        if (!getValues().hasOwnProperty(id)) return false;
        const attributeToSet = dataHoldingAttributeFor[elem.type];
        elem[attributeToSet] = getValues()[id];
    };

    this.oninput = (id, func) => qs(id).oninput = func;
    this.onchange = (id, func) => qs(id).onchange = func;
}

function highlightCopied(obj = {}) {

    obj.copiedClass = obj.copiedClass ?? "copied";
    obj.timeout = obj.timeout ?? "20";

    const elem = obj.elem;
    elem.classList.remove(obj.copiedClass);

    setTimeout(() => {
        elem.classList.add(obj.copiedClass);
    }, obj.timeout);
}


export { qs, SettingsSaver, shuffle, whittle, highlightCopied, };
