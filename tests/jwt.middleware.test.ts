import jwt from "jsonwebtoken";
import { authenticateToken } from "../src/common/jwt.middleware";

describe("authenticateToken middleware", () => {

  //test si token manquant
  it("should return 401 if token is missing", () => {
    const requestuest: any = { headers: {} };//pas de header ->pas token
    const response: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    authenticateToken(requestuest, response, next);//appel de la fonction
    
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      error: "Token manquant dans le header Authorization",
    });
    expect(next).not.toHaveBeenCalled();
  });


  //test si token mal formaté
  it("should return 401 if token is missing or malformed", () => {
    const request: any = { headers: { authorization: "Bearer" } };//header sans token
    const response: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    authenticateToken(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      error: "Token manquant ou mal formaté",
    });
    expect(next).not.toHaveBeenCalled();
  });


  //test si token est invalid ou expiré
  it("should return 401 if token is invalid or expired", () => {
    const request: any = { headers: { authorization: "Bearer invalidtoken" } };
    const response: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid token");
    });
    authenticateToken(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      error: "Token invalide ou expiré",
    });
    expect(next).not.toHaveBeenCalled();
    (jwt.verify as jest.Mock).mockRestore();
  });

});
