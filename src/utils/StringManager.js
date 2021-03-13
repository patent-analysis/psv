import Strings from'../strings';

const _strings = Strings;

const StringManager = {
    get: stringId => _strings[stringId]
}

Object.freeze(StringManager);
export default StringManager;