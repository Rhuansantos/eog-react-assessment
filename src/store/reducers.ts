import { reducer as weatherReducer } from '../Features/Weather/reducer';
import { reducer as MetricsReducer } from '../Features/Dashboard/reducer';

export default {
  weather: weatherReducer,
  metrics: MetricsReducer,
};
