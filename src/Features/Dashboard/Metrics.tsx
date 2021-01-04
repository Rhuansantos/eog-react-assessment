import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from './reducer';
import { IState } from '../../store';
import { LinearProgress, Grid, Container } from '@material-ui/core/';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Select from 'react-select';
import { useQuery, useSubscription } from 'urql';
import makeAnimated from 'react-select/animated';
import Charts from '../../components/Charts';
import CardCharts from '../../components/CardCharts';

const animatedComponents = makeAnimated();

const currentTime = new Date().valueOf();
const passTime = 1800000;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    select: {
      padding: theme.spacing(2),
    },
  }),
);

const queryMultipleMeasurements = `
query($input: [MeasurementQuery] = [
  {metricName: "tubingPressure", after: ${currentTime - passTime}, before: ${currentTime}},
  {metricName: "casingPressure", after: ${currentTime - passTime}, before: ${currentTime}},
  {metricName: "oilTemp", after: ${currentTime - passTime}, before: ${currentTime}},
  {metricName: "flareTemp", after: ${currentTime - passTime}, before: ${currentTime}},
  {metricName: "waterTemp", after: ${currentTime - passTime}, before: ${currentTime}},
  {metricName: "injValveOpen", after: ${currentTime - passTime}, before: ${currentTime}}
]
){
  getMultipleMeasurements(input: $input) {
    metric
    measurements {
     at
     value
     metric
     unit
    }
  }
}`;

const queryMetricSubscription = `
  subscription {
    newMeasurement{
      metric
      at
      value
      unit
    }
  }
`;
export interface MultipleMeasurements {
  measurements: Object;
}

const getMetrics = (state: IState) => {
  const { multipleMeasurements, liveData } = state.metrics;
  return {
    multipleMeasurements,
    liveData,
  };
};

const Metrics = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [selectedChartOptions, setSelectedChartsOptions] = useState([]);
  const { multipleMeasurements, liveData } = useSelector(getMetrics);
  const [resultsLiveMetrics] = useSubscription({
    query: queryMetricSubscription,
  });
  let [resultMultipleMeasurements] = useQuery({
    query: queryMultipleMeasurements,
  });

  const loadDropDown = (): Array<Object> => {
    const tempOptions: any = [];
    Object.entries(multipleMeasurements).forEach((m: any) => {
      tempOptions.push({ value: m[1].metric, label: m[1].metric.replace(/([A-Z])/g, ' $1') });
    });
    return tempOptions;
  };

  const handleChange = (selectedOption: any) => {
    setSelectedChartsOptions(selectedOption);
  };

  // Effect for Multiple and Pass Metrics
  useEffect(() => {
    const { data, error } = resultMultipleMeasurements;
    if (error) {
      dispatch(actions.metricsApiErrorReceived({ error: error?.message }));
      return;
    }
    if (!data) return;
    dispatch(actions.multipleMeasurementsDataRecevied(data?.getMultipleMeasurements));
  }, [dispatch, resultMultipleMeasurements]);

  // Effect for Live Data
  useEffect(() => {
    const { data, error } = resultsLiveMetrics;
    if (error) {
      dispatch(actions.metricsLiveErrorReceived({ error: error?.message }));
      return;
    }
    if (!data) return;
    dispatch(actions.metricLiveDataRecevied(data?.newMeasurement));
  }, [dispatch, resultsLiveMetrics]);

  if (resultMultipleMeasurements?.fetching) return <LinearProgress />;
  return (
    <>
      <Container maxWidth="lg">
        <Grid item xs={10} className={classes.select}>
          <Select
            onChange={handleChange}
            closeMenuOnSelect
            components={animatedComponents}
            isMulti
            options={loadDropDown()}
          />
        </Grid>
      </Container>
      <Grid container spacing={1} className={classes.select}>
        {selectedChartOptions?.map((c, i) => {
          return (
            <Grid key={i} item xs={2}>
              <CardCharts info={c} liveData={resultsLiveMetrics.data.newMeasurement} />
            </Grid>
          );
        })}
      </Grid>
      <Grid container spacing={1} className={classes.select}></Grid>
      <Charts data={multipleMeasurements} liveData={liveData} selectedChartOptions={selectedChartOptions} />
    </>
  );
};

export default Metrics;
