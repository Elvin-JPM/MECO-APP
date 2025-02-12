import { useForm } from "react-hook-form";
import { useState } from "react";
import Input from "../ui/Input"; // Your custom Input component
import Form from "../ui/Form";
import FormRow from "../ui/FormRow";
import Button from "../ui/Button";
import styled, { keyframes } from "styled-components";
import Logo from "../ui/Logo";
import Heading from "../ui/Heading";
import useLogin from "../features/authentication/useLogin";
import useLoginProtected from "../features/authentication/useLoginProtected";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../ui/Spinner";
import Ribbon from "../ui/Ribbon";
import Background from "../ui/Background";
import { useDarkMode } from "../context/DarkModeContext";

// Styled Component for the star field
const StyledLogin = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  //overflow-y: scroll;
  position: relative;
  /* background: url("../../public/white-abstract-bg.jpg") center / cover; */

  > * {
    margin-top: 0;
  }

  @media (min-width: 1200px) {
    height: 100vh;
  }
`;

function Login() {
  const { register, handleSubmit, formState, setValue, watch } = useForm();
  const { isDarkMode } = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);

  const { errors } = formState;
  const navigate = useNavigate();

  const handleIsLoggin = () => {
    setIsLoading((c) => !c);
  };

  // on success callback
  // Esta funcion se ejecutara dentro de la funcion login que viene del Custom Hook
  const onSuccess = (response) => {
    console.log("User data from backend: ", response.data);
    if (response) {
      //localStorage.setItem("authToken", response.data.token);
      console.log("Llamando a loginProtected");
      console.log("Cookies at login:", document.cookie); // Check cookies in frontend
      loginProtected();
    }
  };

  const onSuccessProtectedLogin = (response) => {
    console.log("Data received at login from protected route: ", response);
    if (response.user) {
      console.log("Usuario loggeado: ", response.user.username);
      //localStorage.setItem("username", response.user.username);
      //localStorage.setItem("user_department_id", response.user.id_departamento);
      handleIsLoggin();
      navigate("/meters");
    }
  };

  const { isLoginProtected, loginProtected } = useLoginProtected(
    onSuccessProtectedLogin
  );
  const { isAuthenticating, login } = useLogin(onSuccess, handleIsLoggin);

  function onSubmit(data) {
    console.log("Form data: ", data);
    login(data);
  }

  return (
    <>
      <Background isDarkMode={isDarkMode} />
      <Ribbon />
      <StyledLogin>
        <Form type={"login"} onSubmit={handleSubmit(onSubmit)}>
          <Logo image="../../CND-LOGO.png" />
          <Heading>APP MEDICIÓN COMERCIAL</Heading>

          <FormRow label={"Nombre de Usuario"} type={"login"}>
            <Input
              type="text"
              id="username"
              inputuse={"login"}
              //defaultValue={formatDateForInput(yesterday)}
              placeholder="ej: jgarcia"
              {...register("username", {
                required: "Este campo es obligatorio",
              })}
              //onChange={handlePageReset}
            />
          </FormRow>

          <FormRow label={"Contraseña"} type={"login"}>
            <Input
              type="password"
              id="password"
              inputuse={"login"}
              //defaultValue={formatDateForInput(yesterday)}
              placeholder="Contraseña de tu computadora..."
              {...register("password", {
                required: "Este campo es obligatorio",
              })}
              //onChange={handlePageReset}
            />
          </FormRow>
          {isAuthenticating || isLoginProtected ? "Logging in..." : ""}
          <FormRow>
            <Button
              variation="primary"
              size="large"
              type="submit"
              disabled={isAuthenticating}
              onClick={() => {
                setIsLoading(true);
              }}
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>
          </FormRow>
        </Form>
      </StyledLogin>
    </>
  );
}

export default Login;
