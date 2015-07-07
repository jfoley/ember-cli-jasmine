import Model from 'dummy/models/model';

describe('a model', () => {
  it('can be created', () => {
    let model = Model.create();

    expect(model).toBeDefined();
  });
});
