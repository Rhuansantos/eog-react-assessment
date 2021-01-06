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

const query = `{
  getMetrics
  }
`;

const queryMultipleMeasurements = `
query($input: [MeasurementQuery]){
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
  const { allMetrics, multipleMeasurements, liveData } = state.metrics;
  return {
    allMetrics,
    multipleMeasurements,
    liveData,
  };
};

const Metrics = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [selectedChartOptions, setSelectedChartsOptions] = useState([]);
  const [dropDownOptions, setDropDownOptions] = useState([]);
  const { allMetrics, multipleMeasurements, liveData } = useSelector(getMetrics);

  const [resultgetMetrics] = useQuery({
    query,
  });

  const [resultMultipleMeasurements] = useQuery({
    query: queryMultipleMeasurements,
    variables: {
      // We could also just fetch the metrics the user needs combining the selectedChartOptions hooks
      input: allMetrics.map(metricName => ({
        metricName,
        after: currentTime - passTime,
        before: currentTime,
      })),
    },
  });
  const [resultsLiveMetrics] = useSubscription({
    query: queryMetricSubscription,
  });

  const handleChange = (selectedOption: any) => {
    setSelectedChartsOptions(selectedOption === null ? [] : selectedOption);
  };

  useEffect(() => {
    const tempOptions: any = [];
    allMetrics.forEach((m: any) => {
      tempOptions.push({ value: m, label: m.replace(/([A-Z])/g, ' $1') });
    });
    setDropDownOptions(tempOptions);
  }, [allMetrics]);

  // Get All Avaliable Metrics
  useEffect(() => {
    const { data, error } = resultgetMetrics;
    if (error) {
      dispatch(actions.metricsApiErrorReceived({ error: error?.message }));
      return;
    }
    if (!data) return;

    dispatch(actions.allMetricsDataRecevied(data));
  }, [dispatch, resultgetMetrics]);

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
      dispatch(actions.metricsApiErrorReceived({ error: error?.message }));
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
            options={dropDownOptions}
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
