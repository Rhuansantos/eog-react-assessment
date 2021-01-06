import { takeEvery, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { actions as MetricActions, ApiErrorAction } from './reducer';
import { PayloadAction } from 'redux-starter-kit';

function* apiErrorReceived(action: PayloadAction<ApiErrorAction>) {
  yield call(toast.error, `Error Received: ${action.payload.error}`);
}

// We could have one for each or just recive a parameter to identify the source of the error
export default function* watchApiError() {
  yield takeEvery(MetricActions.metricsApiErrorReceived.type, apiErrorReceived);
}
