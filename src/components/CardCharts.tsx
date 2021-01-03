import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function SimpleCard(props: any) {
  const classes = useStyles();
  const [value, setValue] = useState('');
  const newValue = [props.liveData].find((m: any) => m.metric === props.info.value)?.value;
  useEffect(() => {
    if (newValue !== undefined) {
      setValue(newValue);
    }
  }, [newValue]);

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2">
          {props.info.label}
        </Typography>
        <Typography className={classes.pos} color="textSecondary">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
