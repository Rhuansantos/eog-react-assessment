import { createSlice, PayloadAction } from 'redux-starter-kit';
import moment from 'moment';

export type MultipleMeasurementsTypes = {
  multipleMeasurements: string;
};

export type AllMeasurements = {
  getMetrics: [];
};

export type LiveMetricsTypes = {
  liveData: Array<Object>;
  metric: string;
  value: string;
  at: string;
  unit: string;
};

export type ApiErrorAction = {
  error: string;
};

const initialState = {
  allMetrics: [],
  multipleMeasurements: {},
  liveData: {},
};

const metricSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    allMetricsDataRecevied: (state, action: PayloadAction<AllMeasurements>) => {
      const { getMetrics } = action.payload;
      state.allMetrics = getMetrics;
    },
    multipleMeasurementsDataRecevied: (state, action: PayloadAction<MultipleMeasurementsTypes>) => {
      state.multipleMeasurements = action.payload;
    },
    metricLiveDataRecevied: (state, action: PayloadAction<LiveMetricsTypes>) => {
      state.liveData = [action.payload]?.map(m => ({
        [m.metric]: m.value,
        at: moment(parseInt(m.at)).format('LTS'),
        unit: m.unit,
      }))[0];
    },
    metricsApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const reducer = metricSlice.reducer;
export const actions = metricSlice.actions;
