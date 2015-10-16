import React, {Component} from 'react';
import {Button} from 'stardust';

export default class CompactExample extends Component {
  render() {
    return (
      <div>
        <Button className='compact'>Compact</Button>
        <Button>Normal</Button>
      </div>
    );
  }
}
