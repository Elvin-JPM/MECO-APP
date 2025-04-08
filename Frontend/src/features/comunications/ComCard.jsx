import styled, { keyframes } from "styled-components";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";

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

function ComCard({ group, children, ...props }) {
  const sortedGroup = sortGroupByIP(group);
  const [pingStatuses, setPingStatuses] = useState({});
  const [socket, setSocket] = useState(null);
  const [loadingStatuses, setLoadingStatuses] = useState({});
  // const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_IO_URL || "";
  // const SOCKET_PORT = import.meta.env.VITE_APP_SOCKET_IO_PORT || "";

  // useEffect(() => {
  //   const newSocket = io(`${SOCKET_URL}:${SOCKET_PORT}`);
  //   setSocket(newSocket);

  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    const socketOptions = {
      path: "/socket.io",
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
      pingTimeout: 60000,
    };

    // Debug connection URL
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
      newSocket.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   const newSocket = io(SOCKET_URL);
  //   setSocket(newSocket);

  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    if (socket && sortedGroup.length > 0) {
      const ips = sortedGroup.map((meter) => meter.ip);
      setLoadingStatuses(ips.reduce((acc, ip) => ({ ...acc, [ip]: true }), {})); // Initialize loading to true for all IPs

      socket.emit("startPinging", ips);

      socket.on("pingUpdate", (data) => {
        setPingStatuses((prev) => ({ ...prev, [data.ip]: data }));
        setLoadingStatuses((prev) => ({ ...prev, [data.ip]: false })); // Set loading to false when data arrives
      });
    }
  }, [socket, sortedGroup]);

  if (sortedGroup.length === 0) {
    return <StyledComCard {...props}>No Meters in group</StyledComCard>;
  }

  return (
    <StyledComCard {...props}>
      <CardTitle>{sortedGroup[0].description}</CardTitle>
      <MeterComIndicators>
        {sortedGroup.map((meter) => (
          <IndicatorContainer key={meter.id}>
            <Indicator
              className={loadingStatuses[meter.ip] ? "pulsing" : ""}
              style={{
                backgroundColor: loadingStatuses[meter.ip]
                  ? "grey"
                  : pingStatuses[meter.ip]?.success
                  ? "var(--color-brand-500)"
                  : "var(--color-red-400)",
                transition: "background-color 2s ease",
              }}
            >
              {meter.tipo === "PRINCIPAL" ? "P" : "R"}
            </Indicator>
            <IpText>{meter.ip}</IpText>
          </IndicatorContainer>
        ))}
      </MeterComIndicators>
    </StyledComCard>
  );
}

export default ComCard;
ComCard.displayName = "ComCard";
