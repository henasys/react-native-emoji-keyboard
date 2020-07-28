import {Dimensions, Platform} from 'react-native';
import _ from 'lodash';
require('string.fromcodepoint');

export const toEmoji = code => {
    return String.fromCodePoint(...code.split('-').map(u => '0x' + u));
};

export const isIphoneXorAbove = () => {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        (dimen.height === 812 ||
            dimen.width === 812 ||
            (dimen.height === 896 || dimen.width === 896))
    );
};

export const isAndroid = () => {
    return Platform.OS === 'android';
};

const getEmojiVersion = () => {
    const version = parseFloat(Platform.Version);
    console.log('Platform.Version', Platform.OS, Platform.Version);
    if (Platform.OS === 'ios') {
        return version < 13.2 ? 11 : 12.1;
    } else {
        if (version <= 24) {
            return 1.0;
        } else if (version <= 26) {
            return 3.0;
        } else if (version <= 28) {
            return 5.0;
        } else {
            return 11.0;
        }
    }
};

const hasImageOS = `has_img_${Platform.OS === 'ios' ? 'apple' : 'google'}`;

export const handleDefaultEmoji = (data, blackList) => {
    const emojiVersion = getEmojiVersion();
    console.log('emojiVersion', Platform.OS, emojiVersion);
    const checkedData = data.filter(e => parseFloat(e.added_in) <= emojiVersion && e[hasImageOS] === true);
    const filteredData = checkedData.filter(e => !_.includes(blackList, e.short_name));
    const sortedData = _.orderBy(filteredData, 'sort_order');
    const groupedData = _.groupBy(sortedData, 'category');

    const transformData = _.mapValues(groupedData, group =>
        group.map(value => {
            let skins = null;
            if (value.skin_variations) {
                skins = _.toArray(value.skin_variations).map(skin => {
                    return {
                        code: toEmoji(skin.unified),
                        name: value.name
                    };
                });
            }
            return {
                code: toEmoji(value.unified),
                name: value.short_name,
                added_in: value.added_in,
                skins
            };
        })
    );
    return transformData;
};

export const handleCustomEmoji = (data, blackList) => {
    const filteredData = data.filter(e => !_.includes(blackList, e.name));
    const sortedData = _.orderBy(filteredData, 'sort_order');
    const groupedData = _.groupBy(sortedData, 'category');

    const transformData = _.mapValues(groupedData, group =>
        group.map(value => {
            return {
                code: value.code || null,
                img: value.img || null,
                name: value.name || null,
                skins: value.skins || null
            };
        })
    );
    return transformData;
};
