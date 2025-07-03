# check=skip=JSONArgsRecommended
#---------------------------------------------------------------------------------------------------------------------------
#----   Stage 1: Build
#---------------------------------------------------------------------------------------------------------------------------

FROM ros:humble-ros-base-jammy as base

ENV WORKSPACE_ROOT=/foxglove

#---------------------------------------------------
# Install dependencies
#---------------------------------------------------
RUN apt-get update

RUN apt-get install -y --no-install-recommends  python3-pip \
                                                python3-colcon-common-extensions \
                                                ros-$ROS_DISTRO-foxglove-bridge \
                                                ros-$ROS_DISTRO-rmw-cyclonedds-cpp


#---------------------------------------------------
# Copy your ROS 2 package and build workspace
#---------------------------------------------------
WORKDIR ${WORKSPACE_ROOT}/src

COPY ros2-client/ ./ 
RUN git clone https://github.com/CollaborativeRoboticsLab/event_logger.git

RUN rosdep install --from-paths ${WORKSPACE_ROOT}/src -y --ignore-src

WORKDIR ${WORKSPACE_ROOT}

RUN . /opt/ros/humble/setup.sh && colcon build

#---------------------------------------------------
# Clean up workspace
#---------------------------------------------------
RUN rm -rf ${WORKSPACE_ROOT}/src
RUN rm -rf ${WORKSPACE_ROOT}/log
RUN rm -rf ${WORKSPACE_ROOT}/build

RUN apt-get clean

RUN rm -rf /var/lib/apt/lists/*
RUN rm -rf /tmp/*

#---------------------------------------------------------------------------------------------------------------------------
#----   Stage 2: Runtime
#---------------------------------------------------------------------------------------------------------------------------
FROM ros:humble-ros-base-jammy as final

ENV WORKSPACE_ROOT=/foxglove
ENV RMW_IMPLEMENTATION=rmw_cyclonedds_cpp

# Copy built workspace
COPY --from=base / /

# Optional entrypoint script if needed
COPY /workspace_entrypoint.sh /workspace_entrypoint.sh
RUN chmod +x /workspace_entrypoint.sh

ENTRYPOINT ["/workspace_entrypoint.sh"]
WORKDIR ${WORKSPACE_ROOT}

# CMD executes your launch file with env-configurable parameters
CMD ros2 launch ros2-client foxglove.launch.py
