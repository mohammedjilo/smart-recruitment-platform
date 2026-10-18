import { Card, styled } from "@mui/material"
import { blue } from "@mui/material/colors"
import React from "react"

// StyledCard keeps hover effects but avoids fixed width/height/padding
// so those can be controlled via className (Tailwind classes).
const StyledCard = styled(Card)(() => ({
   backgroundColor: blue[50],
   padding: "20px"
   // leave inner spacing to consumers (via className), but provide sensible defaults
   //   "& .MuiCardContent-root": {
   //     padding: "50px",
   //     "&:last-child": {
   //       paddingBottom: theme.spacing(2),
   //     },
   //   },
   //   "& .MuiTypography-root": {
   //     color: "rgb(var(--fg))",
   //     fontFamily: theme.typography.fontFamily,
   //   },
}))

export default function CustomCard({
   children,
   className,
   ...rest
}: React.PropsWithChildren<{ className?: string }>) {
   return (
      <StyledCard
         className={className}
         {...rest}>
         {children}
      </StyledCard>
   )
}
