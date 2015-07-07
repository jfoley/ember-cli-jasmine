import AComponent from 'dummy/components/a-component';
import { InjectComponentHelpers } from 'ember-cli-jasmine';

describe('a-component', () => {
  InjectComponentHelpers('a-component');

  it('renders', function() {
    var component = this.subject();
    this.render();
    expect(component._state).toEqual('inDOM');
  });
})
