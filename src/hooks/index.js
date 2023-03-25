import * as Raycast from '@raycast/utils';

export const useScryfallSearch = query => {
	const { isLoading, data, error } = Raycast.useFetch(`https://api.scryfall.com/cards/search?q=${query}`, {
		execute: Boolean(query)
	});

	return [data, isLoading, error];
};

export const useScryfallCard = id => {
	const { isLoading, data: card, error } = Raycast.useFetch(`https://api.scryfall.com/cards/${id}`, {
		execute: Boolean(id)
	});

	return [card, isLoading, error];
};

export const useScryfallCardRulings = id => {
	const { isLoading, data: rulings, error } = Raycast.useFetch(`https://api.scryfall.com/cards/${id}/rulings`, {
		execute: Boolean(id)
	});

	return [rulings, isLoading, error];
};

export const useCardImage = (card, size='normal') => {
	if(!card) {
		return null;
	}

	if(card.image_uris?.[size]) {
		return card.image_uris[size];
	}

	return card.card_faces[0].image_uris[size];
}
