import styled, { keyframes } from "styled-components";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

// Pulsing animation
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const StyledComCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-transform: uppercase;
  font-size: 0.8rem;
  border-radius: 0.8rem;
  border: 1px solid #5c5a58;
  height: 9rem;
  padding-left: 5px;
  background-color: var(--color-grey-50);
  gap: 0.7rem;

  &:hover {
    background-color: var(--color-grey-200);
    cursor: pointer;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.4rem;
  align-self: center;
`;

const MeterComIndicators = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-around;
  align-self: stretch;
  font-size: 0.8rem;
`;

const Indicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
  border-radius: 50%;
  width: 2.8rem;
  height: 2.8rem;
  color: white;

  &.pulsing {
    animation: ${pulse} 2s infinite;
  }
`;

const IndicatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
`;

const IpText = styled.span`
  font-size: 1.1rem;
  color: var(--color-grey-600);
  font-weight: 600;
`;

const sortGroupByIP = (group) => {
  return group.sort((a, b) => {
    const ipA = a.ip.split(".").map(Number);
    const ipB = b.ip.split(".").map(Number);

    for (let i = 0; i < 4; i++) {
      if (ipA[i] !== ipB[i]) {
        return ipA[i] - ipB[i];
      }
    }
    return 0;
  });
};

function ComCard({ group, ...props }) {
  const queryClient = useQueryClient();
  const sortedGroup = sortGroupByIP(group);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socketOptions = {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      autoConnect: true,
      forceNew: false,
      pingTimeout: 60000,
      pingInterval: 25000,
    };

    const socketUrl =
      import.meta.env.VITE_APP_ENV === "production"
        ? window.location.origin
        : `${import.meta.env.VITE_APP_SOCKET_IO_URL}:${
            import.meta.env.VITE_APP_SOCKET_IO_PORT
          }`;

    const socket = io(socketUrl, socketOptions);

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listen for updates from the backend
    socket.on("meterStatusUpdated", () => {
      queryClient.invalidateQueries(["meterCommStatusTime"]);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  if (sortedGroup.length === 0) {
    return <StyledComCard {...props}>No Meters in group</StyledComCard>;
  }

  return (
    <StyledComCard {...props}>
      <CardTitle>{sortedGroup[0].description}</CardTitle>
      <MeterComIndicators>
        {sortedGroup.map((meter) => {
          // Determine status based on estadoCom (1 = success, 0/null/undefined = failure)
          const isSuccess = meter.estadoCom === 1;
          const isPulsing = !isConnected; // Pulse while connecting or disconnected

          return (
            <IndicatorContainer key={meter.id}>
              <Indicator
                className={isPulsing ? "pulsing" : ""}
                style={{
                  backgroundColor: isPulsing
                    ? "grey" // Pulsing gray during connection/disconnection
                    : isSuccess
                    ? "var(--color-brand-500)" // Your existing green color
                    : "var(--color-red-400)", // Your existing red color
                  transition: "background-color 0.5s ease",
                }}
              >
                {meter.tipo === "PRINCIPAL" ? "P" : "R"}
              </Indicator>
              <IpText>{meter.ip}</IpText>
            </IndicatorContainer>
          );
        })}
      </MeterComIndicators>
    </StyledComCard>
  );
}

ComCard.propTypes = {
  group: PropTypes.array.isRequired,
  children: PropTypes.node,
};

export default ComCard;
ComCard.displayName = "ComCard";
