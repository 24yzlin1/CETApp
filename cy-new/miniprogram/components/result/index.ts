import { navigateToWordCards } from "../../utils/util";

Component({
  properties: {
    todo: { type: String },
    cards: { type: Array },
    title: { type: String },
  },
  methods: {
    reviewHandle() {
      navigateToWordCards(`${this.data.title}回顾`, this.data.cards);
    },
  },
});
