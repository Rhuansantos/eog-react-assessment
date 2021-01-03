import { createSlice, PayloadAction } from 'redux-starter-kit';
import moment from 'moment';
import { setSyntheticTrailingComments } from 'typescript';

export type MultipleMeasurementsTypes = { 
  multipleMeasurements: string;
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
  multipleMeasurements: {},
  liveData: {}
  // liveData: [{ metric: '', value: 0, at: 0, unit: ''}],
};

const metricSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    multipleMeasurementsDataRecevied: (state, action: PayloadAction<MultipleMeasurementsTypes>) => {
      state.multipleMeasurements = action.payload;
    },
    metricLiveDataRecevied: (state, action: PayloadAction<LiveMetricsTypes>) => {
      state.liveData = [action.payload]?.map((m) => ({
        [m.metric]: m.value,
        at: moment(parseInt(m.at)).format('LTS'),
        unit: m.unit,

      }))[0];
    },
    metricsApiErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
    metricsLiveErrorReceived: (state, action: PayloadAction<ApiErrorAction>) => state,
  },
});

export const reducer = metricSlice.reducer;
export const actions = metricSlice.actions;