import { Box } from "@chakra-ui/core";
import React, { FC } from "react";

const Container: FC = ({ children }) => (
  <Box maxW={400} width="100%" mt={8} mx={"auto"}>
    {children}
  </Box>
);

export default Container;
