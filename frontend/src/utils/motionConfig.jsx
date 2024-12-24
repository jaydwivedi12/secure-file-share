// motionConfig.js
import { motion } from 'framer-motion';

export const pageAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const MotionDiv = ({ children, ...props }) => (
  <motion.div {...props} variants={pageAnimation} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);
