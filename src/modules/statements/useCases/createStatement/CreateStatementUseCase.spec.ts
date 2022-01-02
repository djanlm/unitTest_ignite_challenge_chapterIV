import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Creates statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new statement", async () => {
    const userTest = {
      name: "Test Name",
      email: "email@test.com",
      password: "testePassword",
    };

    const user = await createUserUseCase.execute(userTest);

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 500,
      type: OperationType.DEPOSIT,
      description: "venda de produto",
    });

    expect(statement).toHaveProperty("id");
  });

  it("Should NOT be able to create a new statement if user does not exist", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "nonExistentID",
        amount: 500,
        type: OperationType.WITHDRAW,
        description: "venda de produto",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should NOT be able to create a new statement if the user balance is less than the amount", async () => {
    expect(async () => {
      const userTest = {
        name: "Test Name",
        email: "email@test.com",
        password: "testePassword",
      };

      const user = await createUserUseCase.execute(userTest);

      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 500,
        type: OperationType.WITHDRAW,
        description: "compra de produto",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
