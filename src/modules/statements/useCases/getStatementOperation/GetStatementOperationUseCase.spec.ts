import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getSatementOperationUseCase: GetStatementOperationUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}
describe("Gets statement operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getSatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to get a statement", async () => {
    const userTest = {
      name: "Test Name",
      email: "email@test.com",
      password: "testePassword",
    };

    const user = await createUserUseCase.execute(userTest);
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      type: OperationType.DEPOSIT,
      description: "pagamentoTeste",
    });

    const response = await getSatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(response.description).toBe("pagamentoTeste");
  });

  it("Should NOT be able to get a statement if user does not exist", async () => {
    await expect(async () => {
      const userTest = {
        name: "Test Name",
        email: "email@test.com",
        password: "testePassword",
      };

      const user = await createUserUseCase.execute(userTest);
      const statement = await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 1000,
        type: OperationType.DEPOSIT,
        description: "pagamentoTeste",
      });

      await getSatementOperationUseCase.execute({
        user_id: "fakeId",
        statement_id: statement.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should NOT be able to get a statement if its Id does not exist", async () => {
    await expect(async () => {
      const userTest = {
        name: "Test Name",
        email: "email2@test.com",
        password: "testePassword",
      };
      const user = await createUserUseCase.execute(userTest);

      await getSatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "fakeStatementId",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
