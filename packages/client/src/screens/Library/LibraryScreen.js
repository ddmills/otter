import { Component } from 'react';
import PropTypes from 'prop-types';
import { Heading, CardStatic } from '@grudge/components';
import Page from 'components/Page/Page';
import connect from 'utilities/mobx/Connect';
import { CardType } from '@grudge/domain';
import styles from './LibraryScreen.scss';

@connect(({ cardTypeStore }) => ({
  cardTypes: cardTypeStore.cardTypes,
}))
export default class LobbyScreen extends Component {
  static propTypes = {
    cardTypes: PropTypes.arrayOf(PropTypes.instanceOf(CardType)),
  }

  static defaultProps = {
    cardTypes: [],
  }

  render() {
    const { cardTypes } = this.props;

    return (
      <Page>
        <Heading>
          Card Library
        </Heading>
        <div className={styles.cardList}>
          {cardTypes.map((cardType) => (
            <div style={{ height: '16vh' }} key={cardType.id}>
              <CardStatic cardType={cardType}/>
            </div>
          ))}
        </div>
      </Page>
    );
  }
}
