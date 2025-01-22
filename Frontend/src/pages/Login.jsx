import { useForm } from "react-hook-form";
import { useEffect } from "react";
import Input from "../ui/Input"; // Your custom Input component
import Form from "../ui/Form";
import FormRow from "../ui/FormRow";
import Button from "../ui/Button";
import { useQuery } from "@tanstack/react-query";
import styled, { keyframes } from "styled-components";
import Logo from "../ui/Logo";
import Heading from "../ui/Heading";

// Animation for the stars
const animStarSmall = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-1300px);
  }
`;

const animStarMedium = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-2000px);
  }
`;

const animStarLarge = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-2000px);
  }
`;

// Styled Component for the star field
const StyledLogin = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  /* background: radial-gradient(ellipse at bottom, var(--color-grey-0) 0%, var(--color-grey-300) 35%, var(--color-grey-500) 100%); */

  #stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    border-radius: 50%;
    background: transparent;
    box-shadow: ${(props) =>
      Array.from({ length: props.smallCount || 700 })
        .map(
          () =>
            `${Math.random() * window.innerWidth}px ${
              Math.random() * 2000
            }px #FFF`
        )
        .join(", ")};
    animation: ${animStarSmall} ${(props) => props.smallDuration || 50}s linear
      infinite;
  }

  #stars2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: transparent;
    box-shadow: ${(props) =>
      Array.from({ length: props.mediumCount || 200 })
        .map(
          () =>
            `${Math.random() * window.innerWidth}px ${
              Math.random() * 2000
            }px #FFF`
        )
        .join(", ")};
    animation: ${animStarMedium} ${(props) => props.mediumDuration || 100}s
      linear infinite;
  }

  #stars3 {
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 3px;
    border-radius: 50%;
    background: transparent;
    box-shadow: ${(props) =>
      Array.from({ length: props.largeCount || 100 })
        .map(
          () =>
            `${Math.random() * window.innerWidth}px ${
              Math.random() * 2000
            }px #FBF5DD`
        )
        .join(", ")};
    animation: ${animStarLarge} ${(props) => props.largeDuration || 150}s linear
      infinite;
  }

  > * {
    position: relative;
    z-index: 1; /* Ensure content is above the star field */
  }
`;

function Login() {
  const { register, handleSubmit, formState, setValue, watch } = useForm();
  const { errors } = formState;
  return (
    <StyledLogin
      smallCount={900}
      mediumCount={350}
      largeCount={105}
      smallDuration={48} // Smaller stars move faster
      mediumDuration={90}
      largeDuration={130} // Larger stars move slower
    >
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      <Form type={"login"}>
        <Logo />
        <Heading>MEDICIÓN COMERCIAL</Heading>

        <FormRow label={"Nombre de Usuario"} type={"login"}>
          <Input
            type="text"
            id="username"
            inputuse={"login"}
            //defaultValue={formatDateForInput(yesterday)}
            placeholder="nombre de usuario"
            {...register("username", {
              required: "Este campo es obligatorio",
            })}
            //onChange={handlePageReset}
          />
        </FormRow>

        <FormRow label={"Contraseña"} type={"login"}>
          <Input
            type="text"
            id="username"
            inputuse={"login"}
            //defaultValue={formatDateForInput(yesterday)}
            placeholder="contraseña"
            {...register("username", {
              required: "Este campo es obligatorio",
            })}
            //onChange={handlePageReset}
          />
        </FormRow>
      </Form>
    </StyledLogin>
  );
}

export default Login;
