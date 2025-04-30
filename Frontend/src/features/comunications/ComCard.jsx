import styled, { keyframes } from "styled-components";
import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

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
  const sortedGroup = sortGroupByIP(group);
  const [pingStatuses, setPingStatuses] = useState({});
  const [socket, setSocket] = useState(null);
  const [loadingStatuses, setLoadingStatuses] = useState({});
  const lastIpsRef = useRef([]);

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
      forceNew: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    };

    const socketUrl =
      import.meta.env.VITE_APP_ENV === "production"
        ? window.location.origin
        : `${import.meta.env.VITE_APP_SOCKET_IO_URL}:${
            import.meta.env.VITE_APP_SOCKET_IO_PORT
          }`;

    console.log("Connecting to WebSocket at:", socketUrl);
    const newSocket = io(socketUrl, socketOptions);

    // Debugging events
    newSocket.on("connect", () => {
      console.log("Socket.IO connected with ID:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && sortedGroup.length > 0) {
      const ips = sortedGroup.map((meter) => meter.ip);

      // Initialize loading states
      const initialLoadingStates = ips.reduce(
        (acc, ip) => ({ ...acc, [ip]: true }),
        {}
      );
      setLoadingStatuses(initialLoadingStates);

      // Only emit if IPs changed
      if (JSON.stringify(ips) !== JSON.stringify(lastIpsRef.current)) {
        console.log("Starting ping for IPs:", ips);
        socket.emit("startPinging", ips);
        lastIpsRef.current = ips;
      }

      const pingUpdateHandler = (data) => {
        console.log(
          "Received ping update for IP:",
          data.ip,
          "Success:",
          data.success
        );
        setPingStatuses((prev) => ({
          ...prev,
          [data.ip]: {
            ...data,
            lastUpdate: new Date().toISOString(),
          },
        }));
        setLoadingStatuses((prev) => ({
          ...prev,
          [data.ip]: false,
        }));
      };

      socket.on("pingUpdate", pingUpdateHandler);

      return () => {
        socket.off("pingUpdate", pingUpdateHandler);
      };
    }
  }, [socket, sortedGroup]);

  if (sortedGroup.length === 0) {
    return <StyledComCard {...props}>No Meters in group</StyledComCard>;
  }

  return (
    <StyledComCard {...props}>
      <CardTitle>{sortedGroup[0].description}</CardTitle>
      <MeterComIndicators>
        {sortedGroup.map((meter) => {
          const isPinging = loadingStatuses[meter.ip];
          const pingStatus = pingStatuses[meter.ip];
          const isSuccess = pingStatus?.success;

          return (
            <IndicatorContainer key={meter.id}>
              <Indicator
                className={isPinging ? "pulsing" : ""}
                style={{
                  backgroundColor: isPinging
                    ? "grey"
                    : isSuccess
                    ? "var(--color-brand-500)"
                    : "var(--color-red-400)",
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
