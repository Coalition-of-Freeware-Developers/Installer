import { Addon, AddonTrack, GithubBranchReleaseModel } from 'renderer/utils/InstallerConfiguration';

// Stub for GitVersions to replace @flybywiresim/api-client
export class GitVersions {
  static async getReleases(
    owner: string,
    repo: string,
    _includePrereleases?: boolean,
    _startIndex?: number,
    _count?: number,
  ): Promise<
    Array<{
      name: string;
      publishedAt: Date;
      htmlUrl: string;
      body: string;
    }>
  > {
    console.warn('[GitVersionsStub] getReleases called - returning stub data');
    return [
      {
        name: '1.0.0',
        publishedAt: new Date(),
        htmlUrl: `https://github.com/${owner}/${repo}/releases/tag/1.0.0`,
        body: 'Stub release notes',
      },
    ];
  }

  static async getNewestCommit(
    _owner: string,
    _repo: string,
    _branch: string,
  ): Promise<{
    sha: string;
    timestamp: Date;
  }> {
    console.warn('[GitVersionsStub] getNewestCommit called - returning stub data');
    return {
      sha: 'abc1234567890',
      timestamp: new Date(),
    };
  }
}

export type ReleaseInfo = {
  name: string;
  releaseDate: number;
  changelogUrl?: string;
};

export class AddonData {
  static async latestVersionForTrack(addon: Addon, track: AddonTrack): Promise<ReleaseInfo> {
    switch (track.releaseModel.type) {
      case 'githubRelease':
        return this.latestVersionForReleasedTrack(addon);
      case 'githubBranch':
        return this.latestVersionForRollingTrack(addon, track.releaseModel);
      case 'CDN':
        return this.latestVersionForCDN(track);
    }
  }

  private static async latestVersionForReleasedTrack(addon: Addon): Promise<ReleaseInfo> {
    return GitVersions.getReleases(addon.repoOwner, addon.repoName).then((releases) => ({
      name: releases[0].name,
      releaseDate: releases[0].publishedAt.getTime(),
      changelogUrl: releases[0].htmlUrl,
    }));
  }

  private static async latestVersionForRollingTrack(
    addon: Addon,
    releaseModel: GithubBranchReleaseModel,
  ): Promise<ReleaseInfo> {
    return GitVersions.getNewestCommit(addon.repoOwner, addon.repoName, releaseModel.branch).then((commit) => ({
      name: commit.sha.substring(0, 7),
      releaseDate: commit.timestamp.getTime(),
    }));
  }

  private static async latestVersionForCDN(_track: AddonTrack): Promise<ReleaseInfo> {
    // CDN update checking is not implemented, return placeholder data
    console.warn('[AddonData] CDN update checking is not implemented, returning placeholder data');
    return {
      name: 'CDN Release',
      releaseDate: Date.now(),
    };
  }
}
