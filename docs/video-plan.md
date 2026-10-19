# Video plan

## New videos to record

Twelve short videos are recommended (spec section 15). Each one follows its unit's lab, step by step, in under 15 minutes.

| # | Unit or project | Video |
| --- | --- | --- |
| 1 | K1 | Kubernetes in an hour: create a cluster and explore it with kubectl |
| 2 | K2 | Deploying the course app as a Deployment and Service |
| 3 | P1 | Your first GitHub Actions pipeline |
| 4 | W1 | AWS account safety: MFA, Identity Center and a budget alert |
| 5 | C1 | Containers explained |
| 6 | I1 | Infrastructure as code with the Docker provider |
| 7 | A1 | Ansible basics: inventory and ad-hoc commands |
| 8 | O2 | Prometheus and Grafana for the course app |
| 9 | P5 | GitOps with Argo CD |
| 10 | Project 1 | Walkthrough: Ship it on servers |
| 11 | Project 2 | Walkthrough: Ship it on Kubernetes |
| 12 | Project 3 | Walkthrough: Keep it running |

When a video is published, add it to the unit in `src/data/curriculum.yaml`:

```yaml
video: { youtubeId: "xxxxxxxxxxx", title: "Video title", legacy: false }
```

## Videos from the original course

The six original videos may link to files on the old `main` branch, which moved into `legacy/` in the 2026 refresh.

TODO(owner): update each video description on YouTube to point at the `v1-original` tag, for example `https://github.com/dmccuk/learndevops/tree/v1-original/packer`.

| Chapter | Video | Used on |
| --- | --- | --- |
| 1. Build your first AWS EC2 instance | <https://www.youtube.com/watch?v=XzWyudb4N04> | W2 (legacy) |
| 2. Set up IAM and save your access and secret keys | <https://www.youtube.com/watch?v=1y3IsgvvY84> | Videos page only |
| 3. Set up your control node | <https://youtu.be/1l545lhadz4> | Videos page only |
| 4. Install, configure and run Packer | <https://youtu.be/dIAhHhQ_J-c> | I4 (legacy) |
| 5. Install Terraform and build instances in AWS | <https://youtu.be/VS2sQgUgomE> | I1 (legacy) |
| 6. Terraform code: build your datacentre | <https://youtu.be/yLvDSrnWMyQ> | I5 (legacy) |
