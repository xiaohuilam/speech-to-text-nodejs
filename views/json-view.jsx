import React from 'react';
import PropTypes from 'prop-types';

import { JsonLink, RadioGroup, Radio } from 'watson-react-components';

const RAW = 'raw';
const FORMATTED = 'formatted';

function makeJsonLink(obj, i) {
  if (!obj) {
    return null; // (<div key={`jsonlink-${i}`} />);
  }

  const json = JSON.stringify(obj);
  // space after commas to help browsers decide where breakpoints should go on small screens
  const str = (json.length <= 78) ? json
    : `${json.substr(0, 14)} ...${json.substr(-60).replace(/,/g, ', ')}`;

  return (
    <JsonLink json={obj} key={`jsonlink-${i}`}>
      <code>{str}</code>
    </JsonLink>
  );
}

// we want to insert nulls into the array rather than remove the elements so that the non-null
// items will have the same key
function nullImterim(msg) {
  if (msg.speaker_labels) {
    // some messages can have both results (final or interim) and speaker labels
    // in that case we want to show it for the speaker_labels, even if the result is interim
    return msg;
  } else if (msg.results && msg.results.length && !msg.results[0].final) {
    return null;
  }
  return msg;
}

function nullInterimRaw(raw) {
  if (!raw.json || nullImterim(raw.json)) {
    return raw;
  }
  return null;
}

function renderRawMessage(msg, i) {
  if (!msg) {
    return null; // (<div key={`raw-${i}`} />);
  }
  return (
    <div key={`raw-${i}`}>
      {msg.sent === true
        ? 'Sent: '
        : ' '}
      {msg.sent === false
        ? 'Received: '
        : ''}
      {msg.sent && msg.binary
        ? 'Audio data (ongoing...)'
        : ''}
      {msg.close
        ? `Connection closed: ${msg.code} ${msg.message || ''}`
        : ''}
      {makeJsonLink(msg.json, i)}
    </div>
  );
}

export default React.createClass({
  displayName: 'JsonView',

  propTypes: {
    raw: PropTypes.array.isRequired, // eslint-disable-line
    formatted: PropTypes.array.isRequired, // eslint-disable-line
  },

  getInitialState() {
    return { showRaw: true, interim: false };
  },

  handleShowChange(show) {
    this.setState({
      showRaw: show === RAW,
    });
  },

  handleInterimChange() {
    this.setState({
      interim: !this.state.interim,
    });
  },

  render() {
    // note: this originally rendered the JSON inline with a <Code> tag, but that silently
    // crashed during highlighting.
    // This is probably better for performance anyways.
    try {
      let output;

      if (this.state.showRaw) {
        output = (this.state.interim
          ? this.props.raw
          : this.props.raw.map(nullInterimRaw)).map(renderRawMessage);
      } else {
        output = (this.state.interim
          ? this.props.formatted
          : this.props.formatted.map(nullImterim)).map(makeJsonLink);
      }

      return (
        <div className="jsonview">
        </div>
      );
    } catch (ex) {
      console.log(ex);
      return <div>{ex.message}</div>;
    }
  },
});
