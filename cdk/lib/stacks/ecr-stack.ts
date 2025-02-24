import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";

export class EcrStack extends cdk.Stack {
  public readonly repository: ecr.IRepository;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, "CeeveeRepository", {
      repositoryName: "ceevee",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      imageScanOnPush: true
    });
  }
}