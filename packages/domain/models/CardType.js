import BasicModel from './BasicModel';

export default class CardType extends BasicModel {
  static get defaults() {
    return {
      id: undefined,
      name: 'Card',
      description: 'Card description',
      traits: [],
      playActions: [],
      handActions: [],
    };
  }

  hasTrait(traitId) {
    return Boolean(this.getTrait(traitId));
  }

  getTrait(traitId) {
    return this.traits.find((trait) => trait.id === traitId);
  }
}
