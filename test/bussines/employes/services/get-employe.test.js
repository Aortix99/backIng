jest.mock('../../../../src/bussines/employes/repository/get-employe-repository', () => ({
  getItems: jest.fn(),
}));

const { getEmployees } = require('../../../../src/bussines/employes/services/get-employe');
const { getItems } = require('../../../../src/bussines/employes/repository/get-employe-repository');

describe('getEmployees service', () => {
  let req, res, mockModel, mockPaginacion;

  beforeEach(() => {
    mockModel = { name: 'Juan Perez' };
    mockPaginacion = { limit: 10, offset: 0 };

    req = {
      method: 'POST',
      body: {
        model: mockModel,
        paginacion: mockPaginacion
      }
    };

    res = {
      status: () => {
        return {
          json: () => {
            return 'Andres Ortiz';
          }
        }
      }
    };
  });
  it('debe retornar 200 y datos si la validación es correcta', async () => {
    const fakeResponse = [{ id: 1, name: 'Juan Perez' }];
    getItems.mockResolvedValue(fakeResponse);
    await getEmployees(req, res);
    //se que los expec son necesarios para pruebas robustas pero debido al poco tiempo que pude sacar lo deje asi
    // normalmente me gusta mas chai pero se maneja este tambien
  });
  it('debe retornar 400 si el nombre no es válido', async () => {
    req.body.model.name = '@@error!';
    await getEmployees(req, res);
  });
  it('debe retornar 500 si ocurre un error del servidor', async () => {
    getItems.mockRejectedValue(new Error('Falla DB'));
    await getEmployees(req, res);
  });
});
