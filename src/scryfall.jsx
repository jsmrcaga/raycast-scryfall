import React from 'react';

import {
	Detail,
	Grid,
	ActionPanel,
	Action,
	useNavigation
} from '@raycast/api';

import {
	useScryfallSearch,
	useScryfallCard,
	useScryfallCardRulings,
	useCardImage,
} from './hooks';

const NoResults = ({ query }) => {
	return (
		<Grid>
			<Grid.EmptyView
				title="No results"
				icon={{
					source: 'fblthp.png'
				}}
				description={`No cards matched your query: "${query}"`}
			/>
		</Grid>
	);
}

const GridCardItem = ({ card, onSelected }) => {
	const card_image = useCardImage(card);

	return <Grid.Item
		key={card.id}
		id={card.id}
		title={card.name}
		content={{
			source: card_image
		}}
		keywords={[card.name, card.type_line, card.oracle_text]}
		actions={
			<ActionPanel title={card.name}>
				<Action
					title="View"
					onAction={() => {
						onSelected(card.id);
					}}
				/>
				<ActionPanel.Section title="Open in...">
					<Action.OpenInBrowser
						title="Scryfall"
						shortcut={{
							modifiers: ['cmd'],
							key: 's'
						}}
						url={card.scryfall_uri}
						icon={{
							source: 'scryfall-logo.png'
						}}
					/>
					<Action.OpenInBrowser
						title="Gatherer"
						shortcut={{
							modifiers: ['cmd'],
							key: 'g'
						}}
						url={card.related_uris.gatherer}
						icon={{
							source: 'mtg.png'
						}}
					/>
				</ActionPanel.Section>
			</ActionPanel>
		}
	/>;
}

const CardDetails = ({ id }) => {
	const [card, loading, error] = useScryfallCard(id);
	const [rulings, loadingRulings, rulingsError] = useScryfallCardRulings(id);

	const card_image = useCardImage(card);

	if(loading) {
		return <Detail isLoading markdown=""/>
	}

	const legal_in = Object.entries(card.legalities).filter(([, v]) => v === 'legal').map(([k]) => k);
	const illegal_in = Object.entries(card.legalities).filter(([, v]) => v === 'not_legal').map(([k]) => k);

	return (
		<Detail
			markdown={`
![](${card_image})
			`}
			metadata={
				<Detail.Metadata>
					<Detail.Metadata.Label title="Set" text={card.set_name}/>

					<Detail.Metadata.Separator/>

					<Detail.Metadata.Label title="Type" text={card.type_line}/>

					<Detail.Metadata.TagList title="Legality">
						{
							legal_in.map(l => <Detail.Metadata.TagList.Item key={l} text={l}/>)
						}
						{
							illegal_in.map(l => <Detail.Metadata.TagList.Item key={l} text={l} color="red"/>)
						}
					</Detail.Metadata.TagList>

					<Detail.Metadata.Separator/>

					{
						rulings &&
						<Detail.Metadata.Label
							title="Rulings"
							text={
								rulings.data.sort((a, b) => {
									return new Date(a.published_at) - new Date(b.published_at);
								}).map(({ comment, published_at }) => {
									return `${published_at}: ${comment}`
								}).join('\n\n')
							}
						/>
					}
				</Detail.Metadata>
			}
		/>
	);
};

export default function ScryfallSearch(props) {
	const { query } = props.arguments;

	const { push: navigate } = useNavigation();

	const [data, loading, error] = useScryfallSearch(query);
	const is404 = /Not Found/.test(error);

	// Error state
	if(error) {
		if(is404) {
			return <NoResults query={query}/>;
		}

		return (
			<Grid>
				<Grid.EmptyView
					icon={{
						source: 'fblthp.png'
					}}
					title="Error"
					description={`An error occurred trygin to get data from Scryfall`}
				/>
			</Grid>
		);
	}

	const { total_cards, data: cards } = data || {};

	const grid_items = cards?.map(card => {
		return <GridCardItem
			key={card.id}
			card={card}
			onSelected={() => {
				navigate(<CardDetails id={card.id}/>);
			}}
		/>
	});

	if(total_cards === 0) {
		return <NoResults query={query}/>
	}

	return (
		<Grid
			columns={3}
			isLoading={loading}
			aspectRatio="3/4"
			fit="fill"
		>
			{grid_items}
		</Grid>
	);
}
