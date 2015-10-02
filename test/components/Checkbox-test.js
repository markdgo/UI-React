import React from 'react';
import Checkbox from 'src/components/Checkbox/Checkbox';

describe('Checkbox', () => {
  it('is checked by default', () => {
    let renderedCheckbox = render(<Checkbox defaultChecked={true} name='firstName' />).first();
    let isChecked = renderedCheckbox.refs.checkbox.state.initialChecked;
    renderedCheckbox.props.defaultChecked.should.equal(true);
    isChecked.should.equal(true);
  });
  it('should have a semantic ui plugin to handle the check action', () => {
    let renderedCheckbox = render(<Checkbox name='firstName' label='Include First' />).first();
    renderedCheckbox.container.checkbox.called.should.equal(true);
  });
  it('should have a fitted class if no label is given', () => {
    render(<Checkbox name='firstName' />).findClass('sd-checkbox').props.className.should.contain('fitted');
  });
});
