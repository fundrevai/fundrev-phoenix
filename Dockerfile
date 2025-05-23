# This Dockerfile is provided for convenience if you wish to run Phoenix in a
# container or sidecar. To build the image, run the following commmand:
#
# > docker build -t phoenix
#
# You can then run the image in the background with:
#
# > docker run -d --name phoenix -p 6006:6006 phoenix
#
# or in the foreground with:
#
# > docker run -it -p 6006:6006 phoenix
#
# How are you using Phoenix in production? Let us know!
#
# To get support or provide feedback, contact the team in the #phoenix-support
# channel in the Arize AI Slack community or file an issue on GitHub:
#
# - https://arize-ai.slack.com/join/shared_invite/zt-2w57bhem8-hq24MB6u7yE_ZF_ilOYSBw#/shared-invite/email
# - https://github.com/Arize-ai/phoenix/issues

ARG BASE_IMAGE=gcr.io/distroless/python3-debian12:nonroot
# To deploy it on an arm64, like Raspberry Pi or Apple-Silicon, chose this image instead:
# ARG BASE_IMAGE=gcr.io/distroless/python3-debian12:nonroot-arm64

# This Dockerfile is a multi-stage build. The first stage builds the frontend.
FROM node:22-slim AS frontend-builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /phoenix/app/
COPY ./app /phoenix/app
RUN npm i -g corepack
RUN corepack enable
RUN corepack use pnpm
RUN pnpm install
RUN pnpm run build

# The second stage builds the backend.
FROM python:3.11-bullseye as backend-builder
WORKDIR /phoenix
COPY ./src /phoenix/src
COPY ./pyproject.toml /phoenix/
COPY ./LICENSE /phoenix/
COPY ./IP_NOTICE /phoenix/
COPY ./README.md /phoenix/
COPY --from=frontend-builder /phoenix/src/phoenix/server/static/ /phoenix/src/phoenix/server/static/
# Delete symbolic links used during development.
RUN find src/ -xtype l -delete
RUN pip install --target ./env ".[container, pg]"

# The production image is distroless, meaning that it is a minimal image that
# contains only the necessary dependencies to run the application. This is
# useful for security and performance reasons. If you need to debug the
# container, you can build from the debug image instead and run
#
# > docker run --entrypoint=sh -it phoenix
#
# to enter a shell. For more information, see:
#
# https://github.com/GoogleContainerTools/distroless?tab=readme-ov-file#debug-images
#
# Use the debug tag in the following line to build the debug image.
FROM ${BASE_IMAGE}
WORKDIR /phoenix
COPY --from=backend-builder /phoenix/env/ ./env
ENV PYTHONPATH="/phoenix/env:$PYTHONPATH"
ENV PYTHONUNBUFFERED=1
# Expose the Phoenix port.
EXPOSE 6006
# Expose the Phoenix gRPC port.
EXPOSE 4317
# Expose the Prometheus port.
EXPOSE 9090
# Run the Phoenix server. Note that the ENTRYPOINT of the base image invokes
# Python, so no explicit invocation of Python is needed here. See
# https://github.com/GoogleContainerTools/distroless/blob/16dc4a6a33838006fe956e4c19f049ece9c18a8d/python3/BUILD#L55
CMD ["-m", "phoenix.server.main", "serve"]
